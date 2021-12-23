# naz
**naz** is an esolang where every instruction is named by a number and a letter.

### usage

#### node
first, clone this repository, and install its dependencies:

```
$ npm install
```

you can then run any naz program like so:

```
$ node naz.js filename.naz
```

#### online
you can also experiment with naz using the [web-based interpreter](https://sporeball.dev/naz)! this is usually given less priority than the original Node-based implementation, but should work if you're in a hurry!

### instruction reference
- `0-9` - number literal. exactly **one** of these **must** be placed before every instruction.
- `a` - adds *n* to the register.
- `d` - divides the register by *n*, rounding down.
- `e` - conditional equal to. goto function *n* if the value in the register is *equal to* the value of the variable referenced before this instruction.
- `f` - function instruction:
  - opcode 0 - *calls* function *n*.
  - opcode 1 - *declares* function *n*.
- `g` - conditional greater than. goto function *n* if the value in the register is *greater than* the value of the variable referenced before this instruction.
- `h` - halts program execution. **this is meant to be used for debugging purposes only.**
- `l` - conditional less than. goto function *n* if the value in the register is *less than* the value of the variable referenced before this instruction.
- `m` - multiplies the register by *n*.
- `n` - negates variable *n*.
- `o` - outputs a value determined by the value in the register:
  - 0-9 - outputs that number.
  - 10 - outputs a newline.
  - 32-126 - outputs an ASCII value.
- `p` - divides the register by *n*, then sets the register equal to the remainder.
- `r` - sets the register equal to the ASCII value of the *n*-th character of the input string, then removes that character from the input string.
- `s` - subtracts *n* from the register.
- `v` - variable instruction:
  - opcode 0 - sets the register equal to the value of variable *n*.
  - opcode 2 - sets variable *n* equal to the value in the register.
  - opcode 3 - variable *n* will be considered when executing the conditional instruction that follows.
- `x` - sets the current opcode to *n*.

### opcodes
- `0` - normal operation. instructions will execute one at a time, in order.
- `1` - function write. the interpreter **must** parse a call to the `f` instruction first; instructions will then be added onto the end of the referenced function until a newline is parsed or the opcode is explicitly set to 0.
- `2` - variable write. the interpreter **must** parse a call to the `v` instruction; after this is executed, the interpreter will return to opcode 0.
- `3` - conditional opcode. the interpreter **must** parse a call to the `v` instruction, followed by a call to a conditional instruction (`l`, `e` or `g`). afterwards, the interpreter will return to opcode 0.

### command line flags
- `-d` / `--delay` - sets the delay between execution steps (default: 1ms) (optional)
- `-f` / `--file` - sets the file whose contents will be read by the `r` instruction. this takes precedence over the `-i` flag (default: none) (optional)
- `-i` / `--input` - sets the string to use as input, to be read by the `r` instruction (default: none) (optional)
- `-n` / `--null` - if present, a null byte (U+0000) will be appended to the input
- `-u` / `--unlimited` - if present, the default limits on integer values will be removed

#### notes
- by default, the value in the register must always be between -127 and 127 (both inclusive), or program execution will **immediately halt**. this behavior can be disabled with the `-u` flag.
- conditional instructions can only be run in opcode 3.
- anything placed after a `#` on a line will be ignored, allowing you to comment your code.

### example
the following naz program will add 9 to the register, multiply by 7, and add 2 (resulting in a value of 65), then output once, resulting in a final output of `A`:

```
9a7m2a1o
```

for more complicated examples, check the [examples folder](https://github.com/sporeball/naz/tree/master/examples).

### testing
if you're making some changes and need to make sure everything's still working correctly, you can run tests on some of the example programs like so:

```
$ npm test
```

### computational class
naz is provably as powerful as a finite state automaton, because it can implement the esolang [dd](https://esolangs.org/wiki/Dd). given some input file, the example program [dd.naz](https://github.com/sporeball/naz/blob/master/examples/dd.naz) will follow the dd specification and stop reading input when it encounters a null byte.

as posited by quintopia [here](https://esolangs.org/wiki/Naz#Computational_class), naz `-u` is capable of implementing a universal Turing machine with 5 states and 7 symbols, making it Turing-complete; this means the original language is equivalent to a [bounded-storage machine](https://esolangs.org/wiki/Bounded-storage_machine).

### thanks
the naz interpreter and runner are heavily based on those of the fantastic [\\/\\/>](https://github.com/torcado194/worm), by [torcado](https://github.com/torcado194). <3

the example program [prime.naz](https://github.com/sporeball/naz/blob/master/examples/prime.naz) was designed by [tobiasheineken](https://github.com/tobiasheineken).

### donate
you can support the development of this project and others via Patreon:

[![Support me on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dsporeball%26type%3Dpledges%26suffix%3D%252Fmonth&style=for-the-badge)](https://patreon.com/sporeball)
