"use client"

import {Button} from "@/components/ui/button";
import {
    AlertTriangleIcon,
    BookOpenTextIcon,
    Loader2Icon,
    MoreVerticalIcon,
    PackageOpenIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon
} from "lucide-react";
import Link from "next/link";
import React from "react";
import {Input} from "@/components/ui/input";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {cn} from "@/lib/utils";
import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {MarkdownContent} from "@/components/markdown-content";

type EntityHeaderProps = {
    title: string
    description?: string
    disabled?: boolean
    isCreating?: boolean
} & (
    | { onNew: () => void; newButtonHref?: never; newButtonLabel: string }
    | { newButtonHref: string; onNew?: never; newButtonLabel: string }
    | { onNew?: never; newButtonHref?: never; newButtonLabel?: never }
)

export function EntityHeader({
    title,
    description,
    newButtonLabel,
    disabled,
    isCreating,
    onNew,
    newButtonHref
}: EntityHeaderProps) {

    return <div className="flex flex-row items-center justify-between gap-x-4">
        <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
            {description && (
                <p className="text-xs md:text-sm text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
        {onNew && !newButtonHref && (
            <Button disabled={isCreating || disabled} size="sm" onClick={onNew}>
                <PlusIcon  className="size-4" />
                {newButtonLabel}
            </Button>
        )}
        {newButtonHref && !onNew && (
            <Button size="sm" asChild>
                <Link href={newButtonHref} prefetch>
                    <PlusIcon  className="size-4" />
                    {newButtonLabel}
                </Link>
            </Button>
        )}
    </div>
}

type EntityContainerProps = {
    children: React.ReactNode
    header?: React.ReactNode
    search?: React.ReactNode
    pagination?: React.ReactNode
}

export function EntityContainer({
    children,
    header,
    search,
    pagination
}: EntityContainerProps) {

    return <div className="p-4 md:px-10 md:py-6 h-full">
        <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
            {header}
            <div className="flex flex-col gap-y-4 h-full">
                {search}
                {children}
            </div>
            {pagination}
        </div>
    </div>
}

interface EntitySearchProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function EntitySearch({
    value,
    onChange,
    placeholder = "Search"
}: EntitySearchProps) {
    return <div className="relative ml-auto">
        <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
            className="max-w-[200px] bg-background shadow-none border-border pl-8"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
}

interface EntityPaginationProps {
    page: number
    totalPages: number
    onPageChange: (newPage: number) => void
    disabled: boolean
}

export function EntityPagination({
    page,
    totalPages,
    onPageChange,
    disabled
}: EntityPaginationProps) {
    return <div className="flex items-center justify-center gap-x-2 w-full">
        <div className="flex-1 text-sm text-muted-foreground">
            Page {page} of {totalPages || 1}
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                disabled={page === 1 || disabled}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
            >
                Previous
            </Button>
            <Button
                disabled={page === totalPages || totalPages === 0 || disabled}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
                Next
            </Button>
        </div>
    </div>
}

interface StateViewProps {
    message?: string
}

export function LoadingView({ message }: StateViewProps) {
    return <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4">
        <Loader2Icon className="size-6 animate-spin text-primary" />
        { !!message && (
            <p className="text-sm text-muted-foreground">
                {message}
            </p>
        )}
    </div>
}

export function ErrorView({ message }: StateViewProps) {
    return <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4">
        <AlertTriangleIcon className="size-6 text-primary" />
        { !!message && (
            <p className="text-sm text-muted-foreground">
                {message}
            </p>
        )}
    </div>
}

interface EmptyViewProps extends StateViewProps {
    onNew?: () => void
}

export function EmptyView({ message, onNew }: EmptyViewProps) {
    return <Empty className="border border-dashed bg-white">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <PackageOpenIcon />
            </EmptyMedia>
        </EmptyHeader>
        <EmptyTitle>
            No items
        </EmptyTitle>
        { !!message && (
            <EmptyDescription>
                {message}
            </EmptyDescription>
        )}
        { !!onNew && (
            <Button onClick={onNew}>
                Add item
            </Button>
        )}
    </Empty>
}

interface EntityListProps<T> {
    items: T[]
    renderItem: (item: T, index: number) => React.ReactNode
    getKey?: (item: T, index: number) => string | number
    emptyView?: React.ReactNode
    className?: string
}

export function EntityList<T>({
    items,
    renderItem,
    getKey,
    emptyView,
    className
}: EntityListProps<T>) {
    if (items.length === 0 && emptyView) {
        return <div className="flex-1 flex justify-center items-center">
            <div className="max-w-sm mx-auto">{emptyView}</div>
        </div>
    }

    return <div className={cn(
        "flex flex-col gap-4 overflow-y-auto",
        className
    )}>
        {items.map((item, index) => (
            <div key={getKey ? getKey(item, index) : index}>
                {renderItem(item, index)}
            </div>
        ))}
    </div>
}

interface VocabularyEntityItemProps {
    primaryLanguage: string
    primaryInfo?: string | null
    secondaryLanguage: string
    secondaryInfo?: string | null
    primaryFlag: React.ReactNode
    secondaryFlag: React.ReactNode
    actions?: React.ReactNode
    onRemove?: () => void | Promise<void>
    isRemoving?: boolean
    onClick?: () => void
    className?: string
}

export function VocabularyEntityItem({
    primaryLanguage,
    primaryInfo,
    secondaryLanguage,
    secondaryInfo,
    primaryFlag,
    secondaryFlag,
    actions,
    onRemove,
    isRemoving,
    onClick,
    className
}: VocabularyEntityItemProps) {
    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isRemoving) {
            return
        }

        if (onRemove) {
            await onRemove()
        }
    }

    return <Card
        className={cn(
            "p-4 shadow-none hover:shadow cursor-pointer transition-shadow",
            isRemoving && "opacity-50 cursor-not-allowed",
            className,
        )}
        onClick={() => !isRemoving && onClick?.()}
    >
        <CardContent className="flex flex-row items-center justify-between p-0">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-1">{primaryFlag}</div>
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-medium truncate">{primaryLanguage}</CardTitle>
                        {primaryInfo && (
                            <CardDescription className="text-xs mt-0.5 line-clamp-1">{primaryInfo}</CardDescription>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 text-muted-foreground">↔</div>

                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-1">{secondaryFlag}</div>
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-medium truncate">{secondaryLanguage}</CardTitle>
                        {secondaryInfo && (
                            <CardDescription className="text-xs mt-0.5 line-clamp-1">{secondaryInfo}</CardDescription>
                        )}
                    </div>
                </div>
            </div>

            {(actions || onRemove) && (
                <div className="flex gap-x-2 items-center ml-4 flex-shrink-0">
                    {actions}
                    {onRemove && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                    disabled={isRemoving}
                                >
                                    <MoreVerticalIcon className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                            >
                                <DropdownMenuItem onClick={handleRemove} disabled={isRemoving}>
                                    <TrashIcon className="size-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            )}
        </CardContent>
    </Card>
}

interface MarkdownEntityItemProps {
    title: string
    content: string
    actions?: React.ReactNode
    onRemove?: () => void | Promise<void>
    isRemoving?: boolean
    onClick?: () => void
    className?: string
}

export function MarkdownEntityItem({
   title,
   content,
   actions,
   onRemove,
   isRemoving,
   onClick,
   className
}: MarkdownEntityItemProps) {
    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isRemoving) {
            return
        }

        if (onRemove) {
            await onRemove()
        }
    }

    return <Card
        className={cn(
            "p-4 shadow-none hover:shadow cursor-pointer transition-shadow",
            isRemoving && "opacity-50 cursor-not-allowed",
            className,
        )}
        onClick={() => !isRemoving && onClick?.()}
    >
        <CardContent className="p-0">
            <div className="flex items-start gap-4 p-4">
                <div className="flex-shrink-0 mt-1">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                        <BookOpenTextIcon className="size-5 text-white" />
                    </div>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground text-balance">{title}</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                        <MarkdownContent content={content}/>
                    </div>
                </div>

                {(actions || onRemove) && (
                    <div className="flex gap-x-2 items-center ml-4 flex-shrink-0">
                        {actions}
                        {onRemove && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        disabled={isRemoving}
                                    >
                                        <MoreVerticalIcon className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                >
                                    <DropdownMenuItem onClick={handleRemove} disabled={isRemoving}>
                                        <TrashIcon className="size-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
}