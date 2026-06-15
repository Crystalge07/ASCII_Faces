const TITLE = `  _____ _______  _______ _____ _    ____ _____ 
 |_   _| ____\\ \\/ /_   _|  ___/ \\  / ___| ____|
   | | |  _|  \\  /  | | | |_ / _ \\| |   |  _|  
   | | | |___ /  \\  | | |  _/ ___ \\ |___| |___ 
   |_| |_____/_/\\_\\ |_| |_|/_/   \\_\\____|_____|`;

export function AsciiTitle() {
  return (
    <header className="app-title">
      <pre className="ascii-title" aria-label="Textface">
        {TITLE}
      </pre>
    </header>
  );
}
