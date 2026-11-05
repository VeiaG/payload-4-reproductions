import * as migration_20261105_191649_localize_status from './20261105_191649_localize_status';

export const migrations = [
  {
    up: migration_20261105_191649_localize_status.up,
    down: migration_20261105_191649_localize_status.down,
    name: '20261105_191649_localize_status'
  },
];
