import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { migrateLocalizeStatus } from '@payloadcms/db-postgres/migration-utils'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
     await migrateLocalizeStatus({
          // Generated as `db`, which is the drizzle instance and crashes with
          // "query.getSQL is not a function": the migration calls `db.execute({ drizzle, sql })`,
          // the adapter's signature. Passing the adapter lets it run.
          db: payload.db,
          payload,
          req,
          sql,
          })
  
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Migration code
}
