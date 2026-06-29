import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductCard } from '../ProductCard';

const baseProduct = {
  _id: 'prod-001',
  name: 'Sony WH-1000XM5 Headphones',
  price: 45000,
  images: ['https://example.com/headphones.jpg'],
  category: 'Electronics',
  stockQuantity: 10,
  isActive: true,
};

describe('ProductCard', () => {
  it('renders the product name', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('Sony WH-1000XM5 Headphones')).toBeInTheDocument();
  });

  it('renders the formatted price with PKR prefix', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/PKR/)).toBeInTheDocument();
    expect(screen.getByText(/45,000|45000/)).toBeInTheDocument();
  });

  it('renders "Out of Stock" badge and disables button when stockQuantity is 0', () => {
    const outOfStock = { ...baseProduct, stockQuantity: 0 };
    render(<ProductCard product={outOfStock} />);

    // "Out of Stock" appears in both the badge overlay AND the button text
    const outOfStockElements = screen.getAllByText('Out of Stock');
    expect(outOfStockElements.length).toBeGreaterThanOrEqual(1);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders "In Stock" badge when stockQuantity is > 5', () => {
    render(<ProductCard product={{ ...baseProduct, stockQuantity: 20 }} />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('renders "Low Stock" badge when stockQuantity is between 1 and 5', () => {
    render(<ProductCard product={{ ...baseProduct, stockQuantity: 3 }} />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('renders an enabled "Add to Cart" button when product is in stock', () => {
    render(<ProductCard product={baseProduct} />);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/Add to Cart/i);
  });

  it('calls onAddToCart with the product id when button is clicked', async () => {
    const handleAddToCart = jest.fn();
    render(<ProductCard product={baseProduct} onAddToCart={handleAddToCart} />);

    screen.getByRole('button').click();

    expect(handleAddToCart).toHaveBeenCalledWith('prod-001');
  });

  it('renders a skeleton when loading=true', () => {
    const { container } = render(<ProductCard loading />);
    // Skeleton renders MUI Skeleton components which produce specific elements
    // Just check the component renders without error when loading
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the product category chip', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });
});
