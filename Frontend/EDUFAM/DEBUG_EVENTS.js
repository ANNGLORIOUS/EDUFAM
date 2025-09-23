// Clear localStorage for testing
// Run this in browser console: localStorage.removeItem('edufam_events');

console.log('To clear events and reload fresh data, run in browser console:');
console.log('localStorage.removeItem("edufam_events");');
console.log('Then refresh the page.');

// Check current events
const stored = localStorage.getItem('edufam_events');
if (stored) {
  const events = JSON.parse(stored);
  console.log('Current events in localStorage:', events);
} else {
  console.log('No events in localStorage - will use defaults');
}
