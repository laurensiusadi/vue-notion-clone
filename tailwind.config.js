module.exports = {
  purge: {
    content: ['./public/**/*.html', './src/**/*.vue'],
    options: {
      whitelistPatterns: [ 
        /-(leave|enter|appear)(|-(to|from|active))$/, 
        /^(?!(|.*?:)cursor-move).+-move$/,
        /^router-link(|-exact)-active$/
      ]
    }
  },
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
