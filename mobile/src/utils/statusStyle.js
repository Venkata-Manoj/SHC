export function getStatusStyle(status) {
  switch (status) {
    case 'UPCOMING':
      return { backgroundColor: '#10B98120', color: '#10B981' };
    case 'ONGOING':
      return { backgroundColor: '#FF550020', color: '#FF5500' };
    default:
      return { backgroundColor: '#42424220', color: '#424242' };
  }
}
