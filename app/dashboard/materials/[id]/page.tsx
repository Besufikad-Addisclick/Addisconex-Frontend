import MaterialDetail from './MaterialDetail';

export default function MaterialDetailPage() {
  return <MaterialDetail />;
}

// Remove static generation since we're dealing with dynamic UUIDs
export const dynamic = 'force-dynamic';