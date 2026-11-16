import * as migration_20261111_233323_initial from './20261111_233323_initial';

export const migrations = [
  {
    up: migration_20261111_233323_initial.up,
    down: migration_20261111_233323_initial.down,
    name: '20261111_233323_initial'
  },
];
