import { Filter } from 'bad-words';

const filter = new Filter();

const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+\[\]{}|;:',.<>?/~`=-]+$/;
const whitespaceRegex = /\s/;

export const validateUsername = (username) => {
  const validatedName = validateName(username, "username");
  if (validatedName) return validatedName;
  if (/@/.test(username)) return `Username cannot contain the @ symbol`;
}

export const validateGroupName = groupname => {
  const validatedName = validateName(groupname, "group name");
  if (validatedName) return validatedName;
  if (/&/.test(groupname)) return `Group name cannot contain the & symbol`;
}

const validateName = (name, type) => {
  if (!name) return `Please enter new ${type}`;
  if (name.length < 3) return `The length of ${type} has to be 3 or more characters`;
  if (name.length > 32) return `The maximum length of ${type} is 32 characters`;
  if (filter.isProfane(name)) return `Please remove any profanity from the username`;
}

export const validatePassword = (password) => {
  if (!password) return "Please enter new password";
  if (whitespaceRegex.test(password)) return "Password mustn't contain any spaces";
  if (!passwordRegex.test(password)) return "Password contains invalid characters";
  if (password.length < 6) return "The length of password has to be 6 or more characters";
  if (password.length > 128) return "The maximum length of password is 128 characters";
}

const validateText = (text, type, maxTextLength = 512) => {
  if (!text) return `The ${type} cannot be blank`;
  if (text.length > maxTextLength) return `Maximum length of ${type}s is ${maxTextLength}\n${text.length}/${maxTextLength}`;
  if (text.split('\n').length > 32) return `All ${type}s must have less than 32 new-lines`;
}
export const validatePost = post => validateText(post.trim(), "post");
export const validateComment = comment => validateText(comment.trim(), "comment");
export const validateBio = bio => validateText(bio.trim(), "bio");
export const validateDescription = des => {
  if (des.trim().length > 100) return `Maximum length of description is ${100}\n${des.trim().length}/${100}`;
};

export function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}