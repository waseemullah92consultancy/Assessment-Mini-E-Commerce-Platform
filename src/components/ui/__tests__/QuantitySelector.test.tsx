import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuantitySelector } from '../QuantitySelector';

describe('QuantitySelector', () => {
  it('displays the current value', () => {
    render(<QuantitySelector value={3} onChange={jest.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not allow value to drop below 1 (default min)', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={1} onChange={onChange} />);

    const decreaseBtn = screen.getByLabelText('Decrease quantity');
    expect(decreaseBtn).toBeDisabled();

    fireEvent.click(decreaseBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not allow value to drop below a custom min', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={2} onChange={onChange} min={2} />);

    const decreaseBtn = screen.getByLabelText('Decrease quantity');
    expect(decreaseBtn).toBeDisabled();

    fireEvent.click(decreaseBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with value - 1 when decrease is clicked (above min)', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Decrease quantity'));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange with value + 1 when increase is clicked', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={3} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Increase quantity'));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('does not allow value to exceed max when max is set', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={10} onChange={onChange} max={10} />);

    const increaseBtn = screen.getByLabelText('Increase quantity');
    expect(increaseBtn).toBeDisabled();

    fireEvent.click(increaseBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows incrementing when value is below max', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} max={10} />);

    const increaseBtn = screen.getByLabelText('Increase quantity');
    expect(increaseBtn).not.toBeDisabled();

    fireEvent.click(increaseBtn);
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('disables both buttons when disabled=true', () => {
    render(<QuantitySelector value={3} onChange={jest.fn()} disabled />);

    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
  });
});
