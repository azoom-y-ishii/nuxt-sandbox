<template>
  <form
    class="user-form"
    novalidate
  >
    <div class="item">
      <label class="label">Name:</label>
      <input
        type="text"
        v-bind="attrs('name', { primitive: true })"
      >
    </div>
    <div class="item">
      <label class="label">Address:</label>
      <input
        type="text"
        placeholder="County"
        v-bind="attrs('address.country', { primitive: true })"
      >
      <input
        type="text"
        placeholder="City"
        v-bind="attrs('address.city', { primitive: true })"
      >
    </div>
    <div class="item">
      <span class="label">Links:</span>
      <ul class="links">
        <li
          v-for="(link, index) in user.links"
          :key="index"
        >
          <input
            type="text"
            placeholder="name"
            v-bind="attrs(['links', index, 'name'], { primitive: true })"
          >
          <input
            type="url"
            placeholder="URL"
            v-bind="attrs(['links', index, 'url'], { primitive: true })"
          >
        </li>
      </ul>
      <button
        type="button"
        @click="user.links.push({ name: '', url: '' })"
      >
        リンクを追加
      </button>
    </div>
    <button
      class="button -submit"
      type="submit"
      @click.prevent="onSubmit"
    >
      送信
    </button>
  </form>

  <table>
    <thead>
      <tr>
        <th>Path</th>
        <th>Valid</th>
        <th>Touched</th>
        <th>oneError</th>
        <th>Errors</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>name</td>
        <td>{{ isValid('name') }}</td>
        <td>{{ isTouched('name') }}</td>
        <td>{{ oneError('name') }}</td>
        <td>{{ listErrors('name') }}</td>
      </tr>
      <tr>
        <td>address.country</td>
        <td>{{ isValid('address.country') }}</td>
        <td>{{ isTouched('address.country') }}</td>
        <td>{{ oneError('address.country') }}</td>
        <td>{{ listErrors('address.country') }}</td>
      </tr>
      <tr>
        <td>address.city</td>
        <td>{{ isValid('address.city') }}</td>
        <td>{{ isTouched('address.city') }}</td>
        <td>{{ oneError('address.city') }}</td>
        <td>{{ listErrors('address.city') }}</td>
      </tr>
      <tr
        v-for="(link, index) in user.links"
        :key="index"
      >
        <td>links {{ index }} name</td>
        <td>{{ isValid(['links', index, 'name']) }}</td>
        <td>{{ isTouched(['links', index, 'name']) }}</td>
        <td>{{ oneError(['links', index, 'name']) }}</td>
        <td>{{ listErrors(['links', index, 'name']) }}</td>
      </tr>
      <tr
        v-for="(link, index) in user.links"
        :key="index"
      >
        <td>links {{ index }} url</td>
        <td>{{ isValid(['links', index, 'url']) }}</td>
        <td>{{ isTouched(['links', index, 'url']) }}</td>
        <td>{{ oneError(['links', index, 'url']) }}</td>
        <td>{{ listErrors(['links', index, 'url']) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(3).max(10),
  address: z.object({
    country: z.string().min(1),
    city: z.string().min(1),
  }),
  links: z.array(z.object({
    name: z.string().min(1),
    url: z.string().url().min(1),
  })),
})

type User = z.infer<typeof schema>

const user = ref<User>({
  name: 'John Doe',
  address: {
    country: 'USA',
    city: 'New York',
  },
  links: [
    {
      name: 'GitHub',
      url: 'https://github.com',
    },
  ],
})

const { attrs, isValid, isTouched, oneError, listErrors, touch } = useValidation(user, schema)

const onSubmit = () => {
  touch()
  if (isValid()) {
    // eslint-disable-next-line no-alert
    alert('Valid!')
  } else {
    // eslint-disable-next-line no-alert
    alert('Invalid!')
  }
}
</script>

<style lang="css" scoped>
.user-form {
  > .item > .label {
    display: inline-block;
    width: 100px;
  }

  > .item > .links {
    margin: 5px;
  }

  > .button.-submit {
    display: inline-block;
    margin-top: 40px;
  }
}

table {
  width: 100%;
  text-align: center;
  border-collapse: collapse;
  border-spacing: 0;
}
table th {
  padding: 10px;
  background: #e9faf9;
  border: solid 1px #778ca3;
}
table td {
  padding: 10px;
  border: solid 1px #778ca3;
}
</style>
