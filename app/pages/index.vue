<template>
  <div>
    <h1>User</h1>
    {{ user }}
  </div>
  <div>
    <h1>Users</h1>
    {{ users }}
  </div>
</template>

<script setup lang="ts">
const user = ref<$EndpointResponse<'getUser'>>()
const users = ref<$EndpointResponse<'GET /api/users/'>>()

// Fetch by operationId in the endpoint's openAPI schema
// params are handled collectly as path params ( $fetch is not )
// Not only response but request are type safe
// You can pass all options that $fetch accepts
user.value = await $endpoint.getUser({ params: { id: 1 } })

// If there is no operationId, you can call like this
users.value = await $endpoint['GET /api/users/']()

// You can call plain api defined by defineEventHandler
const _ret = await $endpoint['GET /api/plain']()
</script>
