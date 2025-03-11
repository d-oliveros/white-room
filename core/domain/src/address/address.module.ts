import type { DataSource } from 'typeorm';
import { AddressRepository } from './address.repository';
import { AddressService } from './address.service';

/**
 * AddressModule manages the dependencies and lifecycle of address-related domain services.
 * It provides access to address services while encapsulating their implementation details.
 */
export class AddressModule {
  public readonly addressService: AddressService;
  private readonly addressRepository: AddressRepository;

  constructor(dataSource: DataSource) {
    this.addressRepository = new AddressRepository(dataSource);
    this.addressService = new AddressService(this.addressRepository);
  }
}
