<script setup>
import { computed, onMounted, ref } from 'vue';

const events = ref([]);
const search = ref('');
const category = ref('All');
const loading = ref(false);
const error = ref('');
const showForm = ref(false);
const editingId = ref(null);
const selectedEvent = ref(null);
const categories = ['All', 'Technology', 'Music', 'Education', 'Community', 'Business', 'Sports'];
const blankForm = () => ({ title: '', category: 'Technology', date: '', time: '09:00', location: '', organizer: '', description: '' });
const form = ref(blankForm());

const filteredEvents = computed(() => events.value);
const upcomingCount = computed(() => events.value.filter(e => new Date(`${e.date}T${e.time}`) >= new Date()).length);

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
async function loadEvents() {
  loading.value = true; error.value = '';
  try {
    const params = new URLSearchParams();
    if (search.value.trim()) params.set('search', search.value.trim());
    if (category.value !== 'All') params.set('category', category.value);
    events.value = await request(`/events?${params}`);
  } catch (e) { error.value = e.message; }
  finally { loading.value = false; }
}
function openCreate() { editingId.value = null; form.value = blankForm(); showForm.value = true; }
function openEdit(event) {
  editingId.value = event._id;
  form.value = { title: event.title, category: event.category, date: event.date, time: event.time, location: event.location, organizer: event.organizer, description: event.description };
  showForm.value = true;
}
async function saveEvent() {
  error.value = '';
  try {
    if (editingId.value) await request(`/events/${editingId.value}`, { method: 'PUT', body: JSON.stringify(form.value) });
    else await request('/events', { method: 'POST', body: JSON.stringify(form.value) });
    showForm.value = false; await loadEvents();
  } catch (e) { error.value = e.message; }
}
async function deleteEvent(event) {
  if (!confirm(`Delete "${event.title}"?`)) return;
  try { await request(`/events/${event._id}`, { method: 'DELETE' }); selectedEvent.value = null; await loadEvents(); }
  catch (e) { error.value = e.message; }
}
function dateParts(date) {
  const d = new Date(`${date}T00:00:00`);
  return { day: d.toLocaleDateString('en-US', { day: '2-digit' }), month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() };
}
onMounted(loadEvents);
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#"><span class="brand-mark">✳</span> event<span>hub</span></a>
      <nav><a href="#discover">Discover</a><a href="#about">About</a></nav>
      <button class="button button-small" @click="openCreate">＋ Post an event</button>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> YOUR CITY. YOUR COMMUNITY.</div>
          <h1>Make plans.<br /><em>Make memories.</em></h1>
          <p>Find the moments worth showing up for. Discover local gatherings, learn something new, and connect with your community.</p>
          <div class="hero-actions"><a class="button" href="#discover">Explore events <span>↗</span></a><button class="text-button" @click="openCreate">Share your event →</button></div>
          <div class="hero-stats"><div><strong>{{ events.length }}+</strong><small>events listed</small></div><div><strong>{{ upcomingCount }}</strong><small>coming up</small></div><div><strong>1 place</strong><small>to connect</small></div></div>
        </div>
        <div class="hero-art">
          <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>
          <div class="art-card card-back"><span class="tiny-label">SAVE THE DATE</span><b>GOOD<br />THINGS<br /><i>HAPPEN.</i></b><span class="scribble">✳</span></div>
          <div class="art-card card-front"><div class="art-top"><span>EVENT / 001</span><span>✦</span></div><div class="art-sun"></div><div class="art-bottom"><b>Meet<br />your people.</b><small>Ideas grow together.</small></div></div>
          <div class="floating-note">✦ &nbsp; Find your next thing</div>
        </div>
      </section>

      <section id="discover" class="discover section-wrap">
        <div class="section-heading"><div><div class="eyebrow dark">THE GOOD STUFF</div><h2>What's happening<span>?</span></h2></div><button class="button button-outline" @click="openCreate">＋ Create event</button></div>
        <div class="toolbar">
          <div class="search-box"><span>⌕</span><input v-model="search" @input="loadEvents" placeholder="Search events, places, or topics..." /></div>
          <div class="filters"><button v-for="item in categories" :key="item" :class="{ active: category === item }" @click="category = item; loadEvents()">{{ item }}</button></div>
        </div>
        <div v-if="error" class="notice">{{ error }}</div>
        <div v-if="loading" class="empty-state">Loading events...</div>
        <div v-else-if="!filteredEvents.length" class="empty-state"><div class="empty-icon">✳</div><h3>No events just yet</h3><p>Be the first to put something on the calendar.</p><button class="button" @click="openCreate">Post an event</button></div>
        <div v-else class="event-grid">
          <article v-for="event in filteredEvents" :key="event._id" class="event-card" @click="selectedEvent = event">
            <div class="event-visual" :class="'visual-' + (categories.indexOf(event.category) % 5)">
              <span class="category-tag">{{ event.category }}</span><span class="visual-symbol">{{ event.category === 'Music' ? '♫' : event.category === 'Sports' ? '◉' : event.category === 'Education' ? '✎' : event.category === 'Community' ? '✳' : '✦' }}</span>
              <div class="date-stamp"><b>{{ dateParts(event.date).day }}</b><small>{{ dateParts(event.date).month }}</small></div>
            </div>
            <div class="event-info"><div class="event-meta">{{ event.time }} <span>•</span> {{ event.location }}</div><h3>{{ event.title }}</h3><p>{{ event.description }}</p><div class="event-footer"><span>Hosted by <b>{{ event.organizer }}</b></span><span class="arrow">↗</span></div></div>
          </article>
        </div>
      </section>

      <section id="about" class="bottom-cta"><div><div class="eyebrow">GOT SOMETHING PLANNED?</div><h2>Your event deserves<br />a full room.</h2></div><button class="button button-light" @click="openCreate">Post your event <span>↗</span></button></section>
    </main>
    <footer><a class="brand" href="#"><span class="brand-mark">✳</span> event<span>hub</span></a><p>Bring people together. One event at a time.</p><small>© 2026 EventHub</small></footer>

    <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
      <form class="modal" @submit.prevent="saveEvent">
        <div class="modal-head"><div><div class="eyebrow dark">{{ editingId ? 'UPDATE DETAILS' : 'ADD TO THE CALENDAR' }}</div><h2>{{ editingId ? 'Edit event' : 'Post an event' }}</h2></div><button type="button" class="close" @click="showForm = false">×</button></div>
        <label>Event title<input v-model.trim="form.title" required maxlength="100" placeholder="e.g. Creative Community Meetup" /></label>
        <div class="form-row"><label>Category<select v-model="form.category"><option v-for="c in categories.slice(1)" :key="c">{{ c }}</option></select></label><label>Date<input v-model="form.date" type="date" required /></label></div>
        <div class="form-row"><label>Time<input v-model="form.time" type="time" required /></label><label>Location<input v-model.trim="form.location" required placeholder="Phnom Penh" /></label></div>
        <label>Organizer<input v-model.trim="form.organizer" required placeholder="Your name or organization" /></label>
        <label>Description<textarea v-model.trim="form.description" required maxlength="3000" rows="4" placeholder="What should people know about this event?"></textarea></label>
        <div class="modal-actions"><button type="button" class="button button-outline" @click="showForm = false">Cancel</button><button class="button" type="submit">{{ editingId ? 'Save changes' : 'Publish event' }} ↗</button></div>
      </form>
    </div>

    <div v-if="selectedEvent" class="modal-backdrop" @click.self="selectedEvent = null">
      <div class="modal detail-modal">
        <button class="close detail-close" @click="selectedEvent = null">×</button><span class="category-tag">{{ selectedEvent.category }}</span><h2>{{ selectedEvent.title }}</h2>
        <div class="detail-line">◷ &nbsp; {{ selectedEvent.date }} at {{ selectedEvent.time }}</div><div class="detail-line">⌖ &nbsp; {{ selectedEvent.location }}</div><div class="detail-line">✳ &nbsp; Hosted by {{ selectedEvent.organizer }}</div>
        <p class="detail-description">{{ selectedEvent.description }}</p>
        <div class="modal-actions"><button class="button button-outline" @click="openEdit(selectedEvent); selectedEvent = null">Edit event</button><button class="button button-danger" @click="deleteEvent(selectedEvent)">Delete</button></div>
      </div>
    </div>
  </div>
</template>
