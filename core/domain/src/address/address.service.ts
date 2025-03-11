import type { AddressPartialDto, AddressParsedWithLocationDto } from '@namespace/address-helpers';
import type { AddressRepository, AddressRepositoryGetByArgs } from './address.repository';

import { AddressType, normalizeAddress } from '@namespace/address-helpers';
import { GooglePlaceNotFoundError, populateAddressLocationFields } from '@namespace/google-client';
import { Address } from './address.model';
import { AddressNotFoundError, AddressPopulateLocationFieldsError } from './address.errors';

type SearchAddressParamsDto = {
  searchTerm: string;
  limit?: number;
};

export class AddressService {
  constructor(private addressRepository: AddressRepository) {}

  /**
   * Retrieves an address by the provided criteria.
   * @param {AddressRepositoryGetByArgs} where - The criteria for retrieving the address.
   * @returns {Promise<Address>} A promise that resolves to the Address object.
   */
  async getBy(where: AddressRepositoryGetByArgs): Promise<Address | null> {
    const address = await this.addressRepository.getBy(where);
    return address;
  }

  /**
   * Retrieves an address by its ID.
   * @param {number} id - The ID of the address to retrieve.
   * @returns {Promise<Address>} A promise that resolves to the Address object.
   */
  async getById(id: string): Promise<Address> {
    const address = await this.getBy({ id });
    if (!address) {
      throw new AddressNotFoundError();
    }
    return address;
  }

  /**
   * Searches for addresses based on the provided parameters.
   * @param {SearchAddressParamsDto} params - The parameters for searching addresses.
   * @returns {Promise<Address[]>} A promise that resolves to an array of Address objects.
   */
  async search({ searchTerm, limit }: SearchAddressParamsDto): Promise<Address[]> {
    const addresses = await this.addressRepository.search({
      searchTerm,
      limit,
    });
    return addresses;
  }

  /**
   * Retrieves an address by its address name similarity.
   * @param {AddressParsedWithLocationDto} parsedAddress - The address to search for.
   * @returns {Promise<Address | null>} A promise that resolves to the Address object or null if not found.
   */
  private async getAddressByAddressNameSimilarity(
    parsedAddress: AddressParsedWithLocationDto,
  ): Promise<Address | null> {
    return this.addressRepository.getByAddressNameSimilarity(parsedAddress);
  }

  /**
   * Populates the address location fields if they are not present.
   * @param {AddressParsedWithLocationDto} parsedAddress - The address to populate.
   * @returns {Promise<AddressParsedWithLocationDto>} A promise that resolves to the populated address.
   */
  private async populateAddressLocationFields(
    parsedAddress: AddressParsedWithLocationDto,
  ): Promise<AddressParsedWithLocationDto> {
    if (
      (!parsedAddress.longitude || !parsedAddress.latitude) &&
      parsedAddress.type !== AddressType.Coordinates
    ) {
      try {
        const populatedAddress = await populateAddressLocationFields(parsedAddress);
        return populatedAddress;
      } catch (error) {
        if (error instanceof GooglePlaceNotFoundError) {
          throw new AddressPopulateLocationFieldsError(error.message);
        }
        throw error;
      }
    }
    return parsedAddress;
  }

  /**
   * Creates a new address or returns an existing one if found.
   *
   * @param {AddressPartialDto} addressFields - An object containing the address data.
   * @returns {Promise<Address>} Resolves with the newly created or existing address.
   */
  async getOrCreate(addressFields: AddressPartialDto): Promise<Address> {
    const parsedAddress = normalizeAddress(addressFields);

    // Get address by address name similarity
    let address = await this.getAddressByAddressNameSimilarity(
      parsedAddress as AddressParsedWithLocationDto,
    );

    if (address) {
      return address;
    }

    // Add location fields and google place id if available.
    const parsedAddressWithLocation = await this.populateAddressLocationFields(
      parsedAddress as AddressParsedWithLocationDto,
    );

    address = Address.create(parsedAddressWithLocation);
    await this.addressRepository.save(address);
    return address;
  }
}
