"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FolderIcon, ChevronRight } from "lucide-react";
import { usePracticeSession } from "../hooks/use-practice-session";
import {useTRPC} from "@/trpc/client";
import {useQuery} from "@tanstack/react-query";

export function VocabularySelector() {
    const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
    const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());

    const { setWords } = usePracticeSession();
    const trpc = useTRPC();

    const { data: categories, isLoading: isLoadingCategories } = useQuery(trpc.categories.getCategories.queryOptions({
        parentId: currentCategoryId
    }));

    const { data: categoryPath } = useQuery(trpc.categories.getCategoryPath.queryOptions({
        id: currentCategoryId
    }));

    const { data: words, isLoading: isLoadingWords } = useQuery(trpc.words.getAll.queryOptions({
        categoryId: currentCategoryId
    }));

    const handleWordToggle = (word: any) => {
        const newSelected = new Set(selectedWordIds);
        if (newSelected.has(word.id)) {
            newSelected.delete(word.id);
        } else {
            newSelected.add(word.id);
        }
        setSelectedWordIds(newSelected);
    };

    const handleSelectAll = () => {
        if (!words) return;
        const newSelected = new Set(selectedWordIds);
        const allSelected = words.every((w: any) => newSelected.has(w.id));

        if (allSelected) {
            words.forEach((w: any) => newSelected.delete(w.id));
        } else {
            words.forEach((w: any) => newSelected.add(w.id));
        }
        setSelectedWordIds(newSelected);
    };

    const handleConfirmSelection = () => {
        if (!words) return;
        const selectedWordsList = words.filter((w: any) => selectedWordIds.has(w.id));
        setWords(selectedWordsList);
    };

    if (isLoadingCategories || isLoadingWords) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentCategoryId(null)}
                    className="h-auto p-0 hover:bg-transparent"
                >
                    Root
                </Button>
                {categoryPath?.map((cat: any) => (
                    <div key={cat.id} className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentCategoryId(cat.id)}
                            className="h-auto p-0 hover:bg-transparent"
                        >
                            {cat.name}
                        </Button>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Folders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                                {categories?.length === 0 && <p className="text-sm text-muted-foreground">No subfolders</p>}
                                {categories?.map((category: any) => (
                                    <Button
                                        key={category.id}
                                        variant="ghost"
                                        className="w-full justify-start gap-2"
                                        onClick={() => setCurrentCategoryId(category.id)}
                                    >
                                        <FolderIcon className="h-4 w-4" />
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Words</CardTitle>
                        {words && words.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                                {words.every((w: any) => selectedWordIds.has(w.id)) ? "Deselect All" : "Select All"}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                                {words?.length === 0 && <p className="text-sm text-muted-foreground">No words in this folder</p>}
                                {words?.map((word: any) => (
                                    <div key={word.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                                        <Checkbox
                                            id={word.id}
                                            checked={selectedWordIds.has(word.id)}
                                            onCheckedChange={() => handleWordToggle(word)}
                                        />
                                        <label
                                            htmlFor={word.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            {word.primary} - {word.secondary}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleConfirmSelection}
                    disabled={selectedWordIds.size === 0}
                >
                    Continue with {selectedWordIds.size} words
                </Button>
            </div>
        </div>
    );
}

