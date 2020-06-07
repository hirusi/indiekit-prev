import test from 'ava';
import {decodeQueryParameter, excerpt, random} from '../../services/string.js';

test('Decodes form-encoded query parameter', t => {
  const result = decodeQueryParameter('https%3A%2F%2Ffoo.bar');
  t.is(result, 'https://foo.bar');
});

test('Excerpts first n words from a string', t => {
  const string = 'The quick fox jumped over the lazy fox';
  const result = excerpt(string, 5);
  t.is(result, 'The quick fox jumped over');
});

test('Generates random alpha-numeric string, 5 characters long', t => {
  const result = random();
  t.regex(result, /[\d\w]{5}/g);
});