<script lang="ts">
    interface Props {
        variant?: 'primary' | 'secondary' | 'ghost' | 'warning' | 'danger';
        icon?: string;
        loading?: boolean;
        disabled?: boolean;
        class?: string;
        label?: string;
        type?: 'button' | 'submit' | 'reset';
        title?: string;
        iconClass?: string;
        onclick?: (e: MouseEvent) => void;
    }

    let { 
        variant = 'primary', 
        icon = "", 
        loading = false, 
        disabled = false, 
        class: customClass = "", 
        label = "", 
        type = 'button', 
        title = "", 
        iconClass = "",
        onclick
    }: Props = $props();

    const baseClasses = "flex items-center justify-center gap-2 transition-all font-bold rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
    
    const variantClasses = $derived({
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20",
        secondary: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold",
        warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 transition-all",
        danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition-all"
    }[variant]);

    const sizeClasses = $derived((variant === 'primary') ? "py-3 px-8 text-sm font-black" : "px-4 py-3 text-xs");
</script>

<button
    {type}
    {title}
    disabled={disabled || loading}
    class="{baseClasses} {variantClasses} {sizeClasses} {customClass}"
    {onclick}
>
    {#if loading}
        <i class="fas fa-spinner fa-spin {iconClass}"></i>
        {#if label}{label}{/if}
    {:else}
        {#if icon}
            <i class="{icon} {iconClass}"></i>
        {/if}
        {#if label}{label}{/if}
        <slot />
    {/if}
</button>
