<template>
  <div class="storage-demo">
    <img v-if="url" class="image" :src="url" >
    <form @submit.prevent="uploadPicture">
      <!-- disable the form while uploading -->
      <fieldset :disabled="!!uploadTask">
        <button
          type="button"
          @click="open({ accept: 'image/*', multiple: false })"
        >
          <template v-if="files?.length === 1">
            Selected file: {{ files.item(0)!.name }} (Click to select another)
          </template>
          <template v-else> Select one picture </template>
        </button>

        <br >

        <button>Upload</button>
      </fieldset>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { ref as storageRef } from 'firebase/storage'
import { useFirebaseStorage, useStorageFile } from 'vuefire'

const storage = useFirebaseStorage()
const sampleImageRef = storageRef(storage, 'images/sample.jpg')

const {
  url,
  uploadTask,
  upload,
} = useStorageFile(sampleImageRef)

function uploadPicture() {
  const data = files.value?.item(0)
  if (data) {
    upload(data)
  }
}

const { files, open } = useFileDialog()
</script>

<style scoped>
.storage-demo {
  > .image {
    width: 500px;
  }
}

</style>

