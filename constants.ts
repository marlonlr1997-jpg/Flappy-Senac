export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;
export const GRAVITY = 0.4; // Slightly floaty for better control
export const JUMP_STRENGTH = -7;
export const PIPE_SPEED = 3;
export const PIPE_SPACING = 220; // Distance between pipes
export const PIPE_GAP = 160; // Gap size for the bird to fly through
export const BIRD_SIZE = 34;
export const PIPE_WIDTH = 60;

// SENAC Brand Colors
export const COLOR_SENAC_BLUE = '#004587';
export const COLOR_SENAC_ORANGE = '#F68D2E';
export const COLOR_SKY_TOP = '#E0F7FA';
export const COLOR_SKY_BOTTOM = '#FFFFFF';

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}