package com.lora_connect.application.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.lora_connect.application.room.converters.Converters
import com.lora_connect.application.room.daos.TaskDao
import com.lora_connect.application.room.entities.Task

@Database(entities = [Task::class], version = 5)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun taskDao() : TaskDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            val MIGRATION_4_5 = object : Migration(4, 5) {
                override fun migrate(db: SupportSQLiteDatabase) {
                    // Rename old table
                    db.execSQL("ALTER TABLE Task RENAME TO Task_old")

                    // Create new table with updated structure
                    db.execSQL("""
                        CREATE TABLE IF NOT EXISTS Task (
                            missionId TEXT NOT NULL PRIMARY KEY,
                            createdAt INTEGER NOT NULL,
                            dateTime INTEGER NOT NULL,
                            userId TEXT NULL,
                            userName TEXT NULL,
                            numberOfRescuee INTEGER NULL,
                            status TEXT NULL,
                            latitude REAL NULL,
                            longitude REAL NULL,
                            urgency TEXT NULL,
                            teamId INTEGER NULL,
                            distance REAL NULL,
                            eta REAL NULL,
                            timeOfArrival INTEGER NULL,
                            timeOfCompletion INTEGER NULL,
                            notes TEXT NULL
                        )
                        """.trimIndent()
                    )

                    // Drop old table
                    db.execSQL("DROP TABLE Task_old")
                }
            }
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "LoRa-Connect"
                ).addMigrations(MIGRATION_4_5).build()
                INSTANCE = instance
                instance
            }
        }
    }
}