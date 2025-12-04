'use client';

interface CartItemProps {
  item: any;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div style={styles.container}>
      <img 
        src={item.imageUrl || '/products/placeholder.jpg'} 
        alt={item.name}
        style={styles.image}
      />
      
      <div style={styles.details}>
        <h3 style={styles.name}>{item.name}</h3>
        <p style={styles.price}>₹{item.price}</p>
      </div>

      <div style={styles.quantity}>
        <button onClick={() => onQuantityChange(item.quantity - 1)}>−</button>
        <input 
          type="number" 
          value={item.quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          min="1"
          readOnly
        />
        <button onClick={() => onQuantityChange(item.quantity + 1)}>+</button>
      </div>

      <div style={styles.total}>
        ₹{(item.price * item.quantity).toFixed(2)}
      </div>

      <button 
        style={styles.removeBtn}
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
  } as React.CSSProperties,
  image: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
  } as React.CSSProperties,
  details: {
    flex: 1,
  } as React.CSSProperties,
  name: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
  } as React.CSSProperties,
  price: {
    margin: '0.5rem 0 0',
    fontSize: '0.875rem',
    color: '#666',
  } as React.CSSProperties,
  quantity: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '0.25rem',
  } as React.CSSProperties,
  total: {
    minWidth: '80px',
    textAlign: 'right',
    fontWeight: '600',
    color: '#df172e',
  } as React.CSSProperties,
  removeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#999',
    padding: 0,
  } as React.CSSProperties,
};
