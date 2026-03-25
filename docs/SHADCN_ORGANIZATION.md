# shadcn/ui Component Organization

Automated scripts to organize shadcn/ui components in a modular structure with tests.

## Available Commands

### 1. Install + Organize (Recommended)

```bash
pnpm run shadcn:add <component-name>
```

This command:

1. Installs the component via shadcn/ui
2. Creates folder structure
3. Generates unit tests
4. Creates documentation
5. Removes original file

**Example:**

```bash
pnpm run shadcn:add button
pnpm run shadcn:add tooltip
pnpm run shadcn:add dialog
```

### 2. Organize Existing Component

```bash
pnpm run shadcn:organize <component-name>
```

For already installed components that need to be organized.

## Generated Structure

```
src/components/ui/ComponentName/
  ComponentName.tsx      # Main component
  ComponentName.test.tsx # Unit tests
  index.ts              # Centralized exports
  README.md             # Documentation
```

## Automatic Tests

Each component receives basic tests:

```typescript
describe("ComponentName", () => {
  it("should render without crashing", () => {
    // Basic rendering test
  });

  it("should be accessible", () => {
    // Accessibility tests
  });

  it("should accept custom className", () => {
    // Customization test
  });
});
```

## Automatic Documentation

Each component receives a README with:

- File structure
- Exported components
- Usage example
- Test instructions
- Customization guide

## How It Works

### Script `add-shadcn-component.js`

1. Executes `pnpm dlx shadcn@latest add <component>`
2. Checks if installation was successful
3. Calls the organization script
4. Shows next steps

### Script `organize-shadcn.js`

1. Creates component folder
2. Moves original file
3. Generates `index.ts` with exports
4. Creates tests based on exports
5. Generates README with documentation
6. Removes original file

## Usage Example

```bash
# Install new component
pnpm run shadcn:add select

# Result:
# src/components/ui/Select/
#   Select.tsx
#   Select.test.tsx
#   index.ts
#   README.md

# Use in code
import { Select, SelectContent, SelectItem } from '@/components/ui/Select';
```

## Customization

To modify the generated templates, edit:

- `scripts/organize-shadcn.js` - Main logic
- `scripts/add-shadcn-component.js` - Complete flow

## Limitations

- Works only with official shadcn/ui components
- Generated tests are basic (need to be expanded)
- Assumes standard Next.js project structure

## Benefits

- **Consistent organization** - All components follow the same pattern
- **Tests included** - Base for unit tests
- **Automatic documentation** - README generated automatically
- **Clean imports** - Centralized exports via index.ts
- **Maintainability** - Modular structure facilitates maintenance
