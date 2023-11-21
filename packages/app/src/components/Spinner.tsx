interface SpinnerProps {
  color?: string;
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 25,
  color = "#fff",
}) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderTopColor: `${color}`,
    borderRightColor: `${color}`,
    borderBottomColor: `transparent`,
    borderLeftColor: `transparent`,
    // borderColor: `${color}`,
  };

  return (
    <div
      id="showccial-spinner"
      className="rounded-full border-4 animate-spin-fast"
      style={spinnerStyle}
    ></div>
  );
};
