<script setup lang="ts">
import FileManager from '@/components/FileManager.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div>
        <p class="eyebrow">Artificially • File Management</p>
        <h1>Document control center</h1>
        <p class="subtitle">
          Connected to the Laravel API you built earlier—upload, download, or delete files in real time.
        </p>
      </div>
      <img src="@/assets/logo.png" alt="Artificially logomark" width="64" height="64" />
    </header>

    <main>
      <FileManager />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  min-height: 100vh;
}

.app-header {
  background: #000;
  color: #f8fafc;
  border-radius: 1rem;
  padding: 1.75rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
}

.eyebrow {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: clamp(1.75rem, 3vw, 2.75rem);
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.subtitle {
  max-width: 620px;
  color: rgba(248, 250, 252, 0.85);
}

main {
  flex: 1;
}

@media (max-width: 640px) {
  .app-header {
    flex-direction: column;
  }
}
</style>
