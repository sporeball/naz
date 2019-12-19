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

### flags
- `-d` / `--delay` - sets the delay between execution steps (default: 1ms) (optional)

### command reference
- `0-9` - number literal. exactly **one** of these **must** be placed before every instruction.
- `a` - adds the value before it to the register.
- `d` - divides the register by the value before it, rounding down.
- `h` - halts program execution.
- `m` - multiplies the register by the value before it.
- `o` - outputs a value determined by the value in the register:
  - 0-9 - outputs that number
  - 10 - outputs a newline
  - 32-126 - outputs an ASCII value
- `p` - divides the register by the value before it, then sets the register equal to the remainder.
- `s` - subtracts the value before it from the register.

#### notes
- the value in the register must be between -127 and 127 inclusive. if an instruction causes the register to go outside these values, program execution will **immediately halt**.

### example
the following naz program will add 9 to the register, multiply by 7, and add 2 (resulting in a value of 65), then output once, resulting in a final output of `A`:

```
9a7m2a1o
```

for more complicated examples, check the [examples folder](https://github.com/sporeball/naz/tree/master/examples).

### thanks
the naz interpreter and runner are heavily based on those of the fantastic [\\/\\/>](https://github.com/torcado194/worm), by [torcado](https://github.com/torcado194). <3

### donate
you can support the development of this project and others via Patreon:

<a href="https://patreon.com/sporeball"><img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fsporeball%2Fpledgesssss&style=for-the-badge" /></a>
