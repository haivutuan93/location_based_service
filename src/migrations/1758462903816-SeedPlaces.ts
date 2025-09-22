import { MigrationInterface, QueryRunner } from "typeorm";
import { faker } from '@faker-js/faker';

export class SeedPlaces1758462903816 implements MigrationInterface {
    name = 'SeedPlaces1758462903816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let values = [];
        for (let i = 0; i < 1000; i++) {
            const name = faker.company.name().replace(/'/g, "''");
            const type = faker.helpers.arrayElement(['supermarket', 'gas_station', 'eatery', 'hotel', 'hospital', 'school', 'restaurant', 'cafe', 'bar']);
            const longitude = faker.location.latitude();
            const latitude = faker.location.latitude();
            values.push(`('${name}', '${type}', ST_GeomFromText('POINT(${longitude} ${latitude})', 4326))`);
        }

        const batchSize = 100; // or any other size that works for you
        for (let i = 0; i < values.length; i += batchSize) {
            const batch = values.slice(i, i + batchSize);
            const query = `INSERT INTO place (name, type, location) VALUES ${batch.join(', ')}`;
            await queryRunner.query(query);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM place`);
    }

}
