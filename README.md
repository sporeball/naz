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
- `e` - conditional equal to. executes a function if the value in the register is *equal to* the value of a variable.
- `f` - function command:
  - opcode 0 - *executes* a function.
  - opcode 1 - *declares* a function.
- `g` - conditional greater than. executes a function if the value in the register is *greater than* the value of a variable.
- `h` - halts program execution.
- `l` - conditional less than. executes a function if the value in the register is *less than* the value of a variable.
- `m` - multiplies the register by the value before it.
- `o` - outputs a value determined by the value in the register:
  - 0-9 - outputs that number
  - 10 - outputs a newline
  - 32-126 - outputs an ASCII value
- `p` - divides the register by the value before it, then sets the register equal to the remainder.
- `s` - subtracts the value before it from the register.
- `v` - variable command:
  - opcode 0 - sets the register equal to a variable.
  - opcode 2 - sets a variable equal to the value in the register.
- `x` - sets the current opcode.

### opcodes
- `0` - normal operation. commands will execute one at a time, in order.
- `1` - function write. commands will become part of the function referenced through use of the `f` command until a newline is parsed.
- `2` - variable write. only the `v` command will be accepted, after which the interpreter will return to opcode 0.
- `3` - conditional opcode. the interpreter **must** parse a call to the `v` command, followed by a call to a conditional instruction (`l`, `e` or `g`). afterwards, the interpreter will return to opcode 0..

#### notes
- the value in the register must be between -127 and 127 inclusive. if an instruction causes the register to go outside these values, program execution will **immediately halt**.
- conditional instructions can only be run in opcode 3.

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
