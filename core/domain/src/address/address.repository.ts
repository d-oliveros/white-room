import type { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import {
  AddressType,
  makeFullAddressDisplay,
  normalizeUnitNumber,
} from '@namespace/address-helpers';
import { Address } from './address.model';

type AddressRepositoryGetByAddressIdArgs = {
  id: string;
};

type AddressRepositoryGetByGooglePlaceIdArgs = {
  unitNumber?: string | null;
};

export type AddressRepositoryGetByAddressDisplayArgs = {
  display: string;
};

type AddressRepositoryGetByAddressLocationArgs = {
  latitude: number;
  longitude: number;
  streetNumber?: string | null;
  unitNumber?: string | null;
};

type AddressRepositoryGetByAddressNameSimilarityArgs = {
  stateCode: string;
  city: string;
  zip: string;
  streetName: string | null;
  streetNumber: string | null;
  unitNumber?: string | null;
};

type AddressRepositorySearchParams = {
  limit?: number;
  searchTerm: string;
  addressIds?: string[];
};

export type AddressRepositoryGetByArgs =
  | AddressRepositoryGetByAddressIdArgs
  | AddressRepositoryGetByGooglePlaceIdArgs
  | AddressRepositoryGetByAddressDisplayArgs
  | AddressRepositoryGetByAddressLocationArgs
  | AddressRepositoryGetByAddressNameSimilarityArgs;

// Address Repository
export class AddressRepository extends Repository<Address> {
  constructor(dataSource: DataSource) {
    super(Address, dataSource.createEntityManager());
  }

  async getBy(args: AddressRepositoryGetByArgs): Promise<Address | null> {
    if ('id' in args) {
      return this.getByAddressId(args.id);
    }
    if ('display' in args) {
      return this.getByAddressDisplay(args);
    }
    if ('streetName' in args && 'streetNumber' in args) {
      return this.getByAddressNameSimilarity(args);
    }
    if ('latitude' in args && 'longitude' in args) {
      return this.getByAddressLocation(args);
    }
    return null;
  }

  async getByAddressId(addressId: string): Promise<Address | null> {
    return this.findOne({ where: { id: addressId } });
  }

  async getByAddressDisplay(
    args: AddressRepositoryGetByAddressDisplayArgs,
  ): Promise<Address | null> {
    const display = makeFullAddressDisplay(args);

    return this.createQueryBuilder('address')
      .where('LOWER(address.display) = LOWER(:display)', { display: display ?? '' })
      .getOne();
  }

  async getByAddressLocation(
    args: AddressRepositoryGetByAddressLocationArgs,
  ): Promise<Address | null> {
    const { latitude, longitude, streetNumber, unitNumber } = args;

    const queryBuilder = this.createQueryBuilder('address')
      .where('address.longitude = :longitude', { longitude: parseFloat(longitude.toFixed(6)) })
      .andWhere('address.latitude = :latitude', { latitude: parseFloat(latitude.toFixed(6)) });

    if (streetNumber) {
      queryBuilder
        .andWhere('address.type = :type', { type: AddressType.Address })
        .andWhere('address.streetNumber = :streetNumber', { streetNumber });

      const normalizedUnitNumber = unitNumber ? normalizeUnitNumber(unitNumber) : null;

      if (normalizedUnitNumber) {
        queryBuilder.andWhere('LOWER(address.unitNumber) = LOWER(:unitNumber)', {
          unitNumber: normalizedUnitNumber,
        });
      } else {
        queryBuilder.andWhere('address.unitNumber IS NULL');
      }
    } else {
      queryBuilder.andWhere('address.type = :type', { type: AddressType.Coordinates });
    }

    return queryBuilder.getOne();
  }

  async getByAddressNameSimilarity(
    args: AddressRepositoryGetByAddressNameSimilarityArgs,
  ): Promise<Address | null> {
    const { stateCode, city, zip, streetName, streetNumber, unitNumber } = args;

    if (!streetName || !streetNumber) {
      return null;
    }

    const queryBuilder = this.createQueryBuilder('address')
      .where('address.type = :type', { type: 'address' })
      .andWhere('address.stateCode = :stateCode', { stateCode })
      .andWhere('address.city = :city', { city })
      .andWhere('address.zip = :zip', { zip })
      .andWhere('address.streetName = :streetName', { streetName })
      .andWhere('address.streetNumber = :streetNumber', { streetNumber });

    const normalizedUnitNumber = unitNumber ? normalizeUnitNumber(unitNumber) : null;

    if (normalizedUnitNumber) {
      queryBuilder.andWhere('LOWER(address.unitNumber) = LOWER(:unitNumber)', {
        unitNumber: normalizedUnitNumber,
      });
    } else {
      queryBuilder.andWhere('address.unitNumber IS NULL');
    }

    return queryBuilder.getOne();
  }

  async search(params: AddressRepositorySearchParams): Promise<Address[]> {
    const { limit, searchTerm, addressIds } = params;

    const safeLimit = Math.max(1, Math.min(limit ?? 1, 20));

    let query = this.createQueryBuilder('address').select('address');

    if (addressIds) {
      query = query
        .whereInIds(addressIds)
        .orderBy(
          'CASE address.id ' +
            addressIds.map((id, index) => `WHEN '${id}' THEN ${index}`).join(' ') +
            ' END',
        );
    } else {
      query = query.where('address.display ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    query = query.take(safeLimit);

    return query.getMany();
  }

  async getByCoordinates(latitude: number, longitude: number): Promise<Address | null> {
    return this.createQueryBuilder('address')
      .where('address.type = :type', { type: AddressType.Coordinates })
      .andWhere('address.longitude = :longitude', { longitude: parseFloat(longitude.toFixed(6)) })
      .andWhere('address.latitude = :latitude', { latitude: parseFloat(latitude.toFixed(6)) })
      .getOne();
  }
}
