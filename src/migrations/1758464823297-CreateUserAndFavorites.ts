import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndFavorites1758464823297 implements MigrationInterface {
    name = 'CreateUserAndFavorites1758464823297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_place_location\` ON \`place\``);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_favorites_place\` (\`userId\` int NOT NULL, \`placeId\` int NOT NULL, INDEX \`IDX_e86525c1045e60bd5dc72277e2\` (\`userId\`), INDEX \`IDX_fc70151db4d89ad69b68f2e347\` (\`placeId\`), PRIMARY KEY (\`userId\`, \`placeId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE SPATIAL INDEX \`IDX_497f3216ef683acf6954bd6fb2\` ON \`place\` (\`location\`)`);
        await queryRunner.query(`ALTER TABLE \`user_favorites_place\` ADD CONSTRAINT \`FK_e86525c1045e60bd5dc72277e2f\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_favorites_place\` ADD CONSTRAINT \`FK_fc70151db4d89ad69b68f2e3474\` FOREIGN KEY (\`placeId\`) REFERENCES \`place\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_favorites_place\` DROP FOREIGN KEY \`FK_fc70151db4d89ad69b68f2e3474\``);
        await queryRunner.query(`ALTER TABLE \`user_favorites_place\` DROP FOREIGN KEY \`FK_e86525c1045e60bd5dc72277e2f\``);
        await queryRunner.query(`DROP INDEX \`IDX_497f3216ef683acf6954bd6fb2\` ON \`place\``);
        await queryRunner.query(`DROP INDEX \`IDX_fc70151db4d89ad69b68f2e347\` ON \`user_favorites_place\``);
        await queryRunner.query(`DROP INDEX \`IDX_e86525c1045e60bd5dc72277e2\` ON \`user_favorites_place\``);
        await queryRunner.query(`DROP TABLE \`user_favorites_place\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`CREATE SPATIAL INDEX \`IDX_place_location\` ON \`place\` (\`location\`)`);
    }

}
