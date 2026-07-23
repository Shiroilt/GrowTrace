export default function StatusBadge({ status }) {
  let colors = '';
  switch (status.toLowerCase()) {
    case 'thriving':
      colors = 'bg-primary/10 text-primary';
      break;
    case 'warning':
    case 'dormant':
      colors = 'bg-tertiary/10 text-tertiary';
      break;
    default:
      colors = 'bg-secondary/10 text-secondary';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${colors}`}>
      {status}
    </span>
  );
}
