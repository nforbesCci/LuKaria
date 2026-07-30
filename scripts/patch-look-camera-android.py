"""Patch LookCamera Android SDK: privacy accepted by default.

Reads the Gradle-cached look-camera-sdk AAR and writes
mobile/composeApp/libs/look-camera-sdk-0.0.3-lukaria.aar with
ChooseModeViewModel starting isPrivacyPolicyAccepted=true so
"Let's get started" is enabled without fighting the checkbox.
"""
from __future__ import annotations

import os
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "mobile" / "composeApp" / "libs" / "look-camera-sdk-0.0.3-lukaria.aar"
CACHE = Path.home() / ".gradle" / "caches" / "modules-2" / "files-2.1" / "com.look.camera.sdk" / "look-camera-sdk"


def find_aar() -> Path:
    if not CACHE.exists():
        raise SystemExit(f"Gradle cache missing: {CACHE}. Sync/build mobile once first.")
    aars = sorted(CACHE.rglob("look-camera-sdk-*.aar"), key=lambda p: p.stat().st_mtime, reverse=True)
    # Prefer 0.0.3
    for aar in aars:
        if "0.0.3" in aar.name:
            return aar
    if not aars:
        raise SystemExit("No look-camera-sdk AAR in Gradle cache")
    return aars[0]


def patch_viewmodel(data: bytearray) -> bytearray:
    # aload_0; iconst_0; invokestatic; invokestatic  -> flip iconst_0 to iconst_1
    for i in range(len(data) - 6):
        if data[i] == 0x2A and data[i + 1] == 0x03 and data[i + 2] == 0xB8 and data[i + 5] == 0xB8:
            data[i + 1] = 0x04
            return data
        if data[i] == 0x2A and data[i + 1] == 0x04 and data[i + 2] == 0xB8 and data[i + 5] == 0xB8:
            return data  # already patched
    raise SystemExit("ChooseModeViewModel privacy default pattern not found")


def main() -> None:
    src = find_aar()
    work = Path(os.environ.get("TEMP", "/tmp")) / "look-sdk-android-patch"
    if work.exists():
        shutil.rmtree(work)
    aar_dir = work / "aar"
    classes_dir = work / "classes"
    aar_dir.mkdir(parents=True)
    classes_dir.mkdir(parents=True)

    with zipfile.ZipFile(src) as z:
        z.extractall(aar_dir)

    classes_jar = aar_dir / "classes.jar"
    with zipfile.ZipFile(classes_jar) as z:
        z.extractall(classes_dir)

    vm = classes_dir / "com" / "look" / "camera" / "sdk" / "viewmodel" / "ChooseModeViewModel.class"
    vm.write_bytes(patch_viewmodel(bytearray(vm.read_bytes())))

    new_jar = work / "classes-new.jar"
    with zipfile.ZipFile(new_jar, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in classes_dir.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(classes_dir).as_posix())
    shutil.copy(new_jar, classes_jar)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    if OUT.exists():
        OUT.unlink()
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in aar_dir.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(aar_dir).as_posix())

    print(f"Patched {src.name} -> {OUT}")


if __name__ == "__main__":
    main()
