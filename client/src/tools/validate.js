import { Filter } from 'bad-words';

const filter = new Filter();

const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+\[\]{}|;:',.<>?/~`=-]+$/;
const whitespaceRegex = /\s/;

export const validateUsername = (username) => {
  if (!username) return "Please enter new username";
  if (username.length < 3) return "The length of username has to be 3 or more characters";
  if (username.length > 32) return "The maximum length of username is 32 characters";
  if (filter.isProfane(username)) return "Please remove any profanity from the username";
}
export const validatePassword = (password) => {
  if (!password) return "Please enter new password";
  if (whitespaceRegex.test(password)) return "Password mustn't contain any spaces";
  if (!passwordRegex.test(password)) return "Password contains invalid characters";
  if (password.length < 6) return "The length of password has to be 6 or more characters";
  if (password.length > 32) return "The maximum length of password is 32 characters";
}

const maxTextLength = 512;
const validateText = (text, type) => {
  if (!text) return `The ${type} cannot be blank`;
  if (text.length > maxTextLength) return `Maximum length of ${type}s is ${maxTextLength}\n${text.length}/${maxTextLength}`;
}
export const validatePost = post => validateText(post.trim(), "post");
export const validateComment = comment => validateText(comment.trim(), "comment");