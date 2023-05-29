export default function PrimaryButton({ icon,text, onClick, enabled=true, visible=true}) {
  if (!visible) return null;
  return (
    <button
        disabled={!enabled}
        onClick={onClick}
        className = {`p-4 rounded-xl w-5/12 min-w-min
                    bg-primary-container
                    text-on-primary-container
                    dark:bg-primary-container-dark
                    dark:text-on-primary-container-dark
                    disabled:bg-surface-variant
                    disabled:text-on-surface-variant
                    dark:disabled:bg-surface-variant-dark
                    dark:disabled:text-on-surface-variant-dark
                    `}
        >
            {icon}
            {text}
      </button>
  );
}