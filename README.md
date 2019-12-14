# naz
**naz** is a concise esoteric programming language with simple commands and a single register.

### usage
first, clone this repository, and install its dependencies:

```
$ npm install
```

you can then run any naz program like so:

```
$ node naz.js filename.naz
```

### command reference
- `0-9` - sets the number to be used for the next arithmetic instruction.
- `a` - adds a value to the register.
- `d` - divides the register by a value, rounding down.
- `h` - halts program execution.
- `m` - multiplies the register by a value.
- `o` - outputs a value determined by the value in the register:
  - 0-9 - outputs that number
  - 10 - outputs a newline
  - 32-126 - outputs an ASCII value
- `p` - divides the register by a value, then sets the register equal to the remainder.
- `s` - subtracts a value from the register.
- `:` - comment instruction. the interpreter will ignore all text until the beginning of the next line.

#### notes
- the value in the register must be between -127 and 127 inclusive. if an arithmetic instruction causes the register to go outside these values, program execution will **immediately halt**.
- after each arithmetic instruction, the number to be used for the next arithmetic instruction will reset to 0.

### thanks
the naz interpreter and runner are heavily based on those of the fantastic [\\/\\/>](https://github.com/torcado194/worm), by [torcado](https://github.com/torcado194). <3

### donate
you can support the development of this project and others via Patreon:

<a href="https://patreon.com/sporeball"><img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fsporeball%2Fpledgesssss&style=for-the-badge" /></a>
