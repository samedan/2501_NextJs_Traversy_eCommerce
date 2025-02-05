### Source udemy

> https://www.udemy.com/course/nextjs-ecommerce-course/learn/lecture/47557493#questions/22803589

### Git Source

> https://github.com/bradtraversy/prostore/

### This Git

> https://github.com/samedan/2501_NextJs_Traversy_eCommerce

### ShadCN UI

> https://ui.shadcn.com/

> npx shadcn@latest add button

### Multiple Layouts

# Group

> /app/(root)/layout.tsx

### .env. Constants

> .env

> app/lib/constants

### Lucide React

> npm i lucide-react

### Theme color toggle - NEXT THEMES

> npm i next-themes

> npx shadcn@latest add dropdown-menu

# Local File 'use client'

> /app/components/shared/header/mode-toggle.tsx

### Loading page

> /app/loading.tsx

### Responsive Sheet Menu

> npx shadcn@latest add sheet

### PRISMA

> npm i -D prisma @prisma/client --legacy-peer-deps

> npx prisma init

# Add Product Schema

> /prisma/schema.prisma -> model Product {}

# Add to online DBB

> package.json -> scripts : {"postinstall": "prisma generate"}

# Run loccam

> npx prisma generate

# Run migration

> npx prisma migrate dev --name init

# Prisma STUDIO

> npx prisma studio

### Seed / Write to DBB

> npx tsx ./db/seed

### Read from DBB

# Server function

> /lib/actions/product.actions.ts -> getLatestProducts()

### ZOD Validator & Type Inference

> https://zod.dev/ -> npm i zod

# Validator

> /lib/validators.ts

> /types/index.js

# Verify TypeScript for Product

> /components/product/product-card.tsx -> const ProductCard = ({ product }: { product: Product }) => {}

### NEON Serverless

> https://neon.tech/docs/serverless/serverless-driver#use-the-driver-over-websockets

> npm i @neondatabase/serverless @prisma/adapter-neon ws --legacy-peer-deps

> npm i -D @types/ws bufferutil --legacy-peer-deps

> /prisma/schema.prisma -> previewFeatures = ["driverAdapters"]

# regenerate local condiguration

> npx prisma generate

# New connection for Prisma websockets

> /db/prisma.ts -> product.actions.ts

### Single Product Page

> /product.actions.ts -> xport async function getProductBySlug(slug: string)

> /app/(root)/product/[slug]/page.tsx

### Authentication with NEXt AUTH

> https://authjs.dev/getting-started/adapters/prisma?framework=next-js

> /prisma/schema.prisma -> User, Account, Session schema

# Generate Prisma Client

> npx prisma generate

# Migration

> npx prisma migrate dev --name add_user_based_tables

> ![RanMigration](https://github.com/samedan/2501_NextJs_Traversy_eCommerce/blob/main/_printscreens/01printscreen.jpg)

### Auth BCRYPT

> npm i bcrypt-ts-edge --legacy-peer-deps

# Seed users

> /db/sample-data.ts

> /db/seed.ts

> npx tsx ./db/seed

# Prisma STUDIO

> npx prisma studio

### NEXT-AUTH v5 Beta

> https://authjs.dev/getting-started

> npm i next-auth@beta --legacy-peer-deps

> npm i @auth/prisma-adapter --legacy-peer-deps

### Auth entry

> ./auth.ts

### Auth ROUTES

> /app/api/auth/[...nextauth]/route.ts

### SignIn, signOut

> validators.ts

> route.ts -> localhost/sign-in

> /lib/actions/user.actions.ts -> signInWithCredentials, signOutUser

> /app/(auth)/sign-in/page.tsx

> /app/(auth)/sign-in/credentials-signin-form.tsx

### CallbackURL before Login

> server -> /app/(auth)/sign-in/page.tsx

> client -> /app/(auth)/sign-in/credentials-signin-form.tsx
