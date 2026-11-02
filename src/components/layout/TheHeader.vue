
<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/vue'

const route = useRoute()

const props = withDefaults(defineProps<{
    cartCount?: number
}>(), {
    cartCount: 0
})

const navLinks = [
    { to: '/', label: 'Главная' },
    { to: '/catalog', label: 'Каталог' },
]

const isActive = (path: string) => {
    return route.path === path
}
</script>

<template>
    <header class="the-header">
        <div class="the-header__container">
            <RouterLink to="/" class="the-header__logo">TechShop</RouterLink>

            <nav class="the-header__nav">
                <RouterLink
                    v-for="link in navLinks"
                    :key="link.to"
                    :to="link.to"
                    :class="{ 'the-header__nav-link--active': isActive(link.to) }"
                    class="the-header__nav-link"
                >
                    {{ link.label }}
                </RouterLink>
            </nav>

            <div class="the-header__actions">
                <Show when="signed-out">
                    <div class="the-header__auth">
                        <SignInButton mode="modal">
                          <button class="the-header__auth-btn the-header__auth-btn--login">
                              Войти
                          </button>
                      </SignInButton>

                      <SignUpButton mode="modal">
                          <button class="the-header__auth-btn the-header__auth-btn--signup">
                              Регистрация
                          </button>
                      </SignUpButton>
                    </div>
                </Show>

                <Show when="signed-in">
                    <div class="the-header__user">
                        <UserButton />
                    </div>
                </Show>

                <RouterLink
                    to="/cart"
                    class="the-header__cart-btn"
                    aria-label="Открыть корзину"
                >
                    <span>🛒</span>
                    <span
                        v-if="props.cartCount > 0"
                        class="the-header__badge"
                    >
                        {{ props.cartCount }}
                    </span>
                </RouterLink>
            </div>
        </div>
    </header>
</template>

<style scoped lang="css">
.the-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #fff;
    border-bottom: 1px solid #e5e7eb;
}

.the-header__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
    min-height: 64px;
}

.the-header__logo {
    flex-shrink: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    text-decoration: none;
}

.the-header__nav {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.the-header__nav-link {
    color: #6b7280;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s;
}

.the-header__nav-link:hover {
    color: #111827;
}

.the-header__nav-link--active {
    color: #3b82f6;
}

.the-header__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.the-header__auth {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.the-header__auth-btn {
    padding: 0.55rem 0.85rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background: #fff;
    color: #111827;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.2s, border-color 0.2s;
}

.the-header__auth-btn:hover {
    background-color: #f3f4f6;
}

.the-header__auth-btn--signup {
    background-color: #2563eb;
    border-color: #2563eb;
    color: #fff;
}

.the-header__auth-btn--signup:hover {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
}

.the-header__user {
    display: flex;
    align-items: center;
}

.the-header__cart-btn {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1.25rem;
    transition: background-color 0.2s;
}

.the-header__cart-btn:hover {
    background-color: #f3f4f6;
}

.the-header__badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background-color: #ef4444;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 768px) {
    .the-header__nav {
        display: none;
    }

    .the-header__container {
        padding: 0 0.75rem;
        gap: 0.5rem;
    }

    .the-header__actions {
        gap: 0.35rem;
    }

    .the-header__auth {
        gap: 0.25rem;
    }

    .the-header__auth-btn {
        padding: 0.5rem 0.55rem;
        font-size: 0.75rem;
    }
}

@media (max-width: 390px) {
    .the-header__logo {
        font-size: 1rem;
    }

    .the-header__auth-btn {
        padding: 0.45rem;
        font-size: 0.7rem;
    }
}
</style>
