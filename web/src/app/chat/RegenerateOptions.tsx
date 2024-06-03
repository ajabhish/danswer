import { useChatContext } from "@/components/context/ChatContext";
import { LlmOverride, LlmOverrideManager } from "@/lib/hooks";
import React, { useCallback, useRef, useState } from "react";
import { debounce } from "lodash";
import { DefaultDropdown, RegenerateDropdown } from "@/components/Dropdown";
import { Text } from "@tremor/react";
import { Persona } from "@/app/admin/assistants/interfaces";
import { getFinalLLM } from "@/lib/llm/utils";

import { Modal } from "@/components/Modal";


export default function RegenerateOption({
    llmOverrideManager,
    selectedAssistant,
    onClose
}: {
    llmOverrideManager: LlmOverrideManager;
    selectedAssistant: Persona;
    onClose: () => void
}) {


    const { llmProviders } = useChatContext();
    const { llmOverride, setLlmOverride, temperature, setTemperature } =
        llmOverrideManager;

    // const { llmProviders } = useChatContext();
    const [_, llmName] = getFinalLLM(llmProviders, selectedAssistant);


    const [localTemperature, setLocalTemperature] = useState<number>(
        temperature || 0
    );

    const debouncedSetTemperature = useCallback(
        debounce((value) => {
            setTemperature(value);
        }, 300),
        []
    );

    const handleTemperatureChange = (value: number) => {
        setLocalTemperature(value);
        debouncedSetTemperature(value);
    };


    const llmOptions: { name: string; value: string }[] = [];
    const structureValue = (
        name: string,
        provider: string,
        modelName: string
    ) => {
        return `${name}__${provider}__${modelName}`;
    };
    const destructureValue = (value: string): LlmOverride => {
        const [displayName, provider, modelName] = value.split("__");
        return {
            name: displayName,
            provider,
            modelName,
        };
    };
    llmProviders.forEach((llmProvider) => {
        llmProvider.model_names.forEach((modelName) => {
            llmOptions.push({
                name: modelName,
                value: structureValue(
                    llmProvider.name,
                    llmProvider.provider,
                    modelName
                ),
            });
        });
    });


    const currentModelName = llmOverrideManager.llmOverride.modelName ||
        (selectedAssistant
            ? selectedAssistant.llm_model_version_override || llmName
            : llmName)

    return (
        //     <Modal
        //         onOutsideClick={onClose}
        //         noPadding
        //         className="
        //     w-4/6 
        //     h-4/6
        //     flex
        //     flex-col
        //   "
        //     >
        <div className={"  px-5 flex -mr-6 w-full"}>
            <div className="mx-auto  w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar relative">
                <div className="ml-16">
                    <div className="   flex">

                        {/* <Text className="mb-1">
                    Regenerates?
                </Text>
            <Text className="mb-3">
                <i className="font-medium">

                </i>.

            </Text>
            <Text>
                    New model?
                </Text>
            {structureValue(
                llmOverride.name,
                llmOverride.provider,
                llmOverride.modelName
            )}

            {currentModelName} */}


                        <RegenerateDropdown
                            options={llmOptions}
                            selected={currentModelName}
                            onSelect={(value) =>
                                // TODO change of course
                                console.log(value)
                                // setLlmOverride(destructureValue(value as string))
                            }
                        />
                    </div>
                </div>
            </div>

        </div>
        // </Modal>
    )
}