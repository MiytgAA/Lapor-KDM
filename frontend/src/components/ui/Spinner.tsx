'use client';
export function Spinner({ size = 20 }: { size?: number }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}

export function PageLoader() {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'50vh' }}>
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:16 }}>
        <div className="spinner" style={{ width:36,height:36,borderWidth:3 }} />
        <p className="body-sm">Memuat data...</p>
      </div>
    </div>
  );
}
