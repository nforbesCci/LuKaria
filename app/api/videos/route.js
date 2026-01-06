import { NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

// Initialize MSAL
const msalConfig = {
  auth: {
    clientId: process.env.MS365_CLIENT_ID,
    clientSecret: process.env.MS365_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.MS365_TENANT_ID}`,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

// Get access token
async function getAccessToken() {
  try {
    const clientCredentialRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring token:', error);
    throw new Error(`Failed to acquire access token: ${error.message}`);
  }
}

// Video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];

// Check if file is a video
function isVideoFile(fileName) {
  const lowerName = fileName.toLowerCase();
  return VIDEO_EXTENSIONS.some(ext => lowerName.endsWith(ext));
}

// Get video thumbnail from SharePoint
async function getVideoThumbnail(graphClient, siteId, itemId) {
  try {
    // Try to get thumbnail from SharePoint
    const thumbnailUrl = `/sites/${siteId}/drive/items/${itemId}/thumbnails/0/medium`;
    const thumbnail = await graphClient.api(thumbnailUrl).get();
    return thumbnail.medium?.url || null;
  } catch (error) {
    console.warn('Could not get thumbnail for video:', error.message);
    return null;
  }
}

export async function GET(request) {
  try {
    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '5', 10);

    const accessToken = await getAccessToken();
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    // Get SharePoint site ID and folder path from environment or use defaults
    const siteId = process.env.MS365_SHAREPOINT_SITE_ID;
    const folderPath = process.env.MS365_VIDEOS_FOLDER_PATH || 'Videos'; // Default to 'Videos' folder

    if (!siteId) {
      return NextResponse.json(
        { error: 'SharePoint site ID not configured' },
        { status: 500 }
      );
    }

    console.log('Fetching videos from SharePoint:', { siteId, folderPath, page, pageSize });

    // List files in the Videos folder
    let files;
    try {
      const folderUrl = `/sites/${siteId}/drive/root:/${folderPath}:/children`;
      const response = await graphClient.api(folderUrl).get();
      files = response.value || [];
    } catch (error) {
      // If folder doesn't exist, try root
      console.warn('Folder not found, trying root:', error.message);
      try {
        const rootUrl = `/sites/${siteId}/drive/root/children`;
        const response = await graphClient.api(rootUrl).get();
        files = response.value || [];
      } catch (rootError) {
        console.error('Error fetching files:', rootError);
        return NextResponse.json(
          { error: 'Failed to fetch files from SharePoint' },
          { status: 500 }
        );
      }
    }

    // Filter for video files
    const videoFiles = files.filter(file => isVideoFile(file.name));

    // Get thumbnails and additional info for each video
    const videos = await Promise.all(
      videoFiles.map(async (file) => {
        let thumbnail = null;
        try {
          thumbnail = await getVideoThumbnail(graphClient, siteId, file.id);
        } catch (error) {
          console.warn(`Could not get thumbnail for ${file.name}:`, error.message);
        }

        return {
          id: file.id,
          name: file.name,
          webUrl: file.webUrl,
          downloadUrl: file['@microsoft.graph.downloadUrl'] || file.webUrl,
          thumbnail: thumbnail,
          size: file.size,
          lastModified: file.lastModifiedDateTime,
          createdBy: file.createdBy?.user?.displayName || 'Unknown',
        };
      })
    );

    // Sort by last modified date (newest first)
    videos.sort((a, b) => {
      const dateA = new Date(a.lastModified);
      const dateB = new Date(b.lastModified);
      return dateB - dateA;
    });

    // Calculate pagination
    const totalVideos = videos.length;
    const totalPages = Math.ceil(totalVideos / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedVideos = videos.slice(startIndex, endIndex);

    return NextResponse.json({
      videos: paginatedVideos,
      pagination: {
        page,
        pageSize,
        totalVideos,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

