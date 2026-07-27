package com.lukariagroup.app.core

object Roles {
    const val CLAIM = "https://lukariagroup.com/roles"
    const val PATIENT = "Patient"
    const val ADMIN = "Admin"
    const val DOCTOR = "Doctor"

    fun fromClaims(roles: List<String>?): Set<String> =
        roles?.map { it.trim() }?.filter { it.isNotEmpty() }?.toSet().orEmpty()

    fun isPatient(roles: Collection<String>): Boolean = !isStaff(roles)

    fun isAdmin(roles: Collection<String>): Boolean =
        roles.any { it.equals(ADMIN, ignoreCase = true) }

    fun isDoctor(roles: Collection<String>): Boolean =
        roles.any { it.equals(DOCTOR, ignoreCase = true) }

    fun isStaff(roles: Collection<String>): Boolean = isAdmin(roles) || isDoctor(roles)
}
