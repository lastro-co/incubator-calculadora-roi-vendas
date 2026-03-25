import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

/**
 * User type definition
 */
interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * User factory using fishery and faker
 *
 * @example
 * import { userFactory } from './userFactory';
 *
 * // Create a random user
 * const user = userFactory.build();
 *
 * // Create a user with custom name
 * const customUser = userFactory.build({ name: 'Jesus' });
 */
export const userFactory = Factory.define<User>(() => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
}));
