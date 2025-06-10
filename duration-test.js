// Quick test to check duration formatting
const formatDuration = (seconds) => {
  // Handle various input types
  if (!seconds && seconds !== 0) return '0:00';

  // Convert to number if it's a string
  const totalSeconds = parseInt(seconds);
  if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

// Test cases
console.log('Duration Tests:');
console.log('233 seconds =', formatDuration(233)); // Should be 3:53
console.log('3600 seconds =', formatDuration(3600)); // Should be 1:00:00
console.log('188000 seconds =', formatDuration(188000)); // This might be what's causing 52:13:20
console.log('What 52:13:20 would be in seconds:', 52 * 3600 + 13 * 60 + 20); // 188000

// Amy MacDonald "This is the Life" should be around 3-4 minutes (233 seconds)
console.log('Expected for Amy MacDonald:', formatDuration(233));
