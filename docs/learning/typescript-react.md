## Types and interfaces
TypeScript checks types as you write them and will give errors if inconsistent type are used.
Interfaces similar to classes but just describe individual objects of a certain shape, does not have a constructor or method code blocks but can list methods that exist - useful for plain data like towns and function inputs. When behaviour and data are both needed, a class is a better option.
Any object with the correct shape will fit - structural typing so implement or new are not needed.
e.g.
interface Van {
    id: string;
    capacityKg: number;
    status: string;
}
const luton: Van = { id: 'AK69ZTO', capacityKg: 750, status: 'idle' };

## Union types

## Typing function parameters and return values

## React components and props

## useState

## useEffect

## Still unclear

## Time spent