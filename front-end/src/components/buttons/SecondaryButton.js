export default function SecondaryButton({ icon,text, onClick, enabled=true, visible=true}) {
    if (!visible) return null;
    return (
      <button
          disabled={!enabled}
          onClick={onClick}
          className = {`p-4 w-1/6 ml-4 rounded-xl cursor-pointer hover:shadow-md
                      bg-tertiary
                      text-on-tertiary
                      dark:bg-tertiary-dark
                      dark:text-on-tertiary-dark
                      disabled:bg-tertiary-container
                      disabled:text-on-tertiary-container
                      dark:disabled:bg-tertiary-container-dark
                      dark:disabled:text-on-tertiary-container-dark
                      `}
          >
              {icon}
              {text}
        </button>
    );
  }