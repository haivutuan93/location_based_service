import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class InitialMigration1726912800000 implements MigrationInterface {
    name = 'InitialMigration1726912800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "place",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "type",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "location",
                        type: "point",
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            "place",
            new TableIndex({
                name: "IDX_place_location",
                columnNames: ["location"],
                isSpatial: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("place", "IDX_place_location");
        await queryRunner.dropTable("place");
    }

}
