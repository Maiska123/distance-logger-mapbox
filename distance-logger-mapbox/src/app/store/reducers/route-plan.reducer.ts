import { LinkedList } from './../../interfaces/linked-list';
import { createReducer, on } from '@ngrx/store';
import { Direction } from '../../interfaces/direction';
import {
  addAddress,
  copyAddress,
  setAddress,
  removeAddress,
} from '../actions/route-plan.actions';

export const initialState: Direction[] = []; //new LinkedList();

export const addressReducer = createReducer(
  initialState,
  on(addAddress, (state, { direction }) => {
    let nextState: Direction[] = state
      ? [...state]
      : [];
    nextState.push(direction);
    state = nextState ?? [];
    return state;
  }),
  on(removeAddress, (state, { direction }) => {
    if (!state) return state;

    let nextState: Direction[] = [...state];
    let index = nextState.findIndex((dir) => dir.id === direction.id);

    if (index > -1) nextState.splice(index, 1);

    state = nextState ?? [];
    return state;
  }),
  on(copyAddress, (state, { direction }) => {
    if (!state) return state;

    let nextState: Direction[] = [...state];
    let index = nextState.findIndex((dir) => dir.id === direction.id);

    if (index > -1) nextState.push(direction);
    state = nextState ?? [];
    return state;
  }),
  on(setAddress, (state, { directions }) => {
    let nextState: Direction[] = directions
      ? [...directions]
      : [...state];

    state = nextState ?? [];
    return state;
  })
);
