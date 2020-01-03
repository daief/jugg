module.exports = source => {
  return `export default ${JSON.stringify(source)}`;
};
