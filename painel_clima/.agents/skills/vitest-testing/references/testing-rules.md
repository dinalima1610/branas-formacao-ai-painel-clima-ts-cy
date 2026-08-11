Testes

* Use **Vitest** para definir cenários e expectativas (`describe`, `it`, `expect`, etc.). Use a API **`vi`** do Vitest para mocks, spies e stubs (`vi.fn`, `vi.spyOn`, `vi.mock`, `vi.useFakeTimers`, entre outros). Não use Jest nem Sinon para essa finalidade.

```ts
import { describe, expect, it } from "vitest";

describe("CreateUser", () => {
  it("should create a user successfully", () => { ... });
});
```

* Para rodar os testes, use o comando `npm run test` (script deve invocar o Vitest) ou `npx vitest`, conforme o projeto.

* Coloque os testes na pasta mais adequada à tecnologia em uso.

* Siga a extensão recomendada pela ferramenta (por exemplo `.test.ts` / `.spec.ts`).

* Não crie dependências entre testes. Deve ser possível executar cada teste de forma independente.

* Siga o princípio Arrange, Act, Assert (ou Given, When, Then) para manter organização e legibilidade nos testes.

```ts
import { expect, it } from "vitest";

it("should calculate the total with discount", () => {
  // Arrange
  const cart = new Cart();
  cart.addItem({ price: 100, quantity: 2 });

  // Act
  const total = cart.calculateTotal(0.1);

  // Assert
  expect(total).toBe(180);
});
```

* Se o comportamento depender de `Date` e isso for relevante ao que está sendo testado, use timers falsos do Vitest para garantir repetibilidade.

```ts
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-15"));
});

afterEach(() => {
  vi.useRealTimers();
});
```

* Se um teste depender de recursos externos (HTTP, banco, mensageria, sistema de arquivos, API), deixe claro no nome ou na pasta que é teste de integração.

* Crie testes para endpoints HTTP. Esses testes NÃO devem usar bibliotecas como supertest e devem ser testes de integração. Crie-os apenas para fluxos principais e alternativos (foco em status codes e mensagens de erro), deixando variações de regra de negócio para os testes de caso de uso.

* Crie testes para todos os casos de uso. Teste sempre os fluxos principais e pelo menos um fluxo alternativo que lance exceções. Use `vi.fn` (ou módulos mockados com `vi.mock`) para evitar APIs externas nesse nível.

```ts
import { expect, it, vi } from "vitest";

it("should throw when user is not found", async () => {
  const userRepository = { findById: vi.fn().mockResolvedValue(null) };
  const useCase = new BlockUser(userRepository);
  await expect(useCase.execute("invalid-id")).rejects.toThrow("User not found");
});
```

* Crie testes para toda a lógica de domínio. Teste todas as possibilidades e variações de regra, sempre em nível unitário, sem depender de recursos externos.

* Concentre-se em testar um comportamento por teste. Evite testes muito grandes.

* Seja claro e objetivo na descrição do teste.

* Garanta que o código escrito esteja coberto pelos testes.

* Crie expectativas consistentes, verificando de fato o que importa.

* Feche conexões de banco ou de plataforma de mensageria após os testes, quando necessário.

* Use `beforeEach` (importado de `vitest`, se não estiver com `globals` habilitado no config) para inicialização.

* Use `afterEach` se precisar liberar recursos, como conexões de banco ou de mensageria.
