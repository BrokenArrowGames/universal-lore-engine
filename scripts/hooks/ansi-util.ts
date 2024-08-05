export const AnsiCmd = {
  Up: (n) => `\x1b[${n}A`,
  Down: (n) => `\x1b[${n}B`,
};
export const AnsiHideCursor = "\x1b[?25l";
export const AnsiShowCursor = "\x1b[?25h";
export const AnsiSaveCursor = "\x1b[s";
export const AnsiRestorCursor = "\x1b[u";
export const AnsiClearLine = "\x1b[K";
export const AnsiRestoreColor = "\x1b[0m";

export enum AnsiNorm {
  RED = "\x1b[00;31m",
  GREEN = "\x1b[00;32m",
  YELLOW = "\x1b[00;33m",
  BLUE = "\x1b[00;34m",
  PURPLE = "\x1b[00;35m",
  CYAN = "\x1b[00;36m",
  GRAY = "\x1b[00;37m",
}

export enum AnsiLight {
  RED = "\x1b[01;31m",
  GREEN = "\x1b[01;32m",
  YELLOW = "\x1b[01;33m",
  BLUE = "\x1b[01;34m",
  PURPLE = "\x1b[01;35m",
  CYAN = "\x1b[01;36m",
  WHITE = "\x1b[01;37m",
}
