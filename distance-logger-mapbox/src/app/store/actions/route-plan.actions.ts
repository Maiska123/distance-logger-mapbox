import { createAction, props } from '@ngrx/store';
import { Direction } from '../../interfaces/direction';

export const addAddress = createAction('[RoutePlan Component] AddAddress', props<{direction: Direction}>());
export const removeAddress = createAction('[RoutePlan Component] RemoveAddress', props<{direction: Direction}>());
export const copyAddress = createAction('[RoutePlan Component] CopyAddress', props<{direction: Direction}>());
export const setAddress = createAction('[RoutePlan Component] SetAddress', props<{directions: Direction[]}>());
