import React from 'react';
import '../../styles/components.css';

export default function PodViewer({ imageUrl, note }) {
  return (
    <div className="pod-viewer">
      <img src={imageUrl} alt="Proof of Delivery" className="pod-image" style={{ maxWidth: '100%', borderRadius: '8px' }} />
      {note && <p className="cell-sub" style={{ marginTop: '0.5rem' }}>{note}</p>}
    </div>
  );
}